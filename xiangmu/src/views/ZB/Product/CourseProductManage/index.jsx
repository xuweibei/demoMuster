import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, InputNumber, Radio } from 'antd';
const RadioGroup = Radio.Group;
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split } from '@/utils';
import { getCourseList } from '@/actions/base';
import { getCourseProductInfo, updateProductCource } from '@/actions/product';
import ContentBox from '@/components/ContentBox';
import { searchFormItemLayout, searchFormItemLayout24} from '@/utils/componentExt';

const FormItem = Form.Item;
const Search = Input.Search;
const TreeNode = Tree.TreeNode;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class CourseProductManage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            checkedKeys: [],
            expandedKeys: [],
            searchValue: '',
            autoExpandParent: true,
            courseTreeNodes: [],
        };
    }

    componentWillMount() {
        //检索课程商品最全数据
        this.fetchCourseProductInfo(this.state.dataModel.product.productId);
        //检索课程商品对应项目所有课程（启用）
        this.fetchCourseList(this.state.dataModel.itemIds);
    }

    //检索课程商品最全数据
    fetchCourseProductInfo = (productId) => {
        this.setState({ loading: true });
        this.props.getCourseProductInfo(productId).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                let { courseIds } = data.data;
                let checkedKeys = split(courseIds).map(a => `thrid:${a}`);
                this.setState({ dataModel: data.data, checkedKeys, expandedKeys: checkedKeys, loading: false })
            }
        })
    }

    //检索课程商品对应项目所有课程（启用）
    fetchCourseList = (itemId) => {
        var condition = { currentPage: 1, pageSize: 9999, itemId: itemId, courseStatus: 1, state: 1 }
        //过滤指定科目的商品
        condition.courseCategoryId = this.state.dataModel.product.courseCategoryId;
        this.props.getCourseList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                message.error(data.message);
            }
            else {
                //构造树结构
                let nodes = [];
                let allNodes = [];
                //相同授课方式
                let { teachMode } = this.state.dataModel.product;
                data.data
                    .filter(a => a.teachMode == teachMode)
                    .map((courseInfo, index) => {
                        let { itemId, itemName } = courseInfo.courseCategoryVo.item;
                        var firstNode = nodes.find(a => a.value == `${itemId}`);
                        if (!firstNode) {
                            firstNode = { name: itemName, value: `${itemId}`, key: `first:${itemId}`, child: [], depth: 1 };
                            nodes.push(firstNode);
                            allNodes.push(firstNode);
                        }

                        let { courseCategoryId, name } = courseInfo.courseCategoryVo;
                        var secondNode = firstNode.child.find(a => a.value == `${courseCategoryId}`);
                        if (!secondNode) {
                            secondNode = { name: name, value: `${courseCategoryId}`, key: `second:${courseCategoryId}`, child: [], depth: 2 };
                            firstNode.child.push(secondNode);
                            allNodes.push(secondNode);
                        }

                        let { courseId, courseName } = courseInfo;
                        var thridNode = secondNode.child.find(a => a.value == `${courseId}`);
                        if (!thridNode) {
                            thridNode = { name: courseName, value: `${courseId}`, key: `thrid:${courseId}`, child: [], depth: 3 };
                            secondNode.child.push(thridNode);
                            allNodes.push(thridNode);
                        }
                    })
                this.setState({ courseTreeNodes: nodes, allTreeNodes: allNodes })
            }
        })
    }

    //项目->科目->课程树
    renderTree(menus) {
        if (!menus) { return null };
        let { searchValue } = this.state;
        return menus.map((item) => {
            let subMenu = item.child;
            let childs = this.renderTree(subMenu);

            const index = item.name.indexOf(searchValue);
            const beforeStr = item.name.substr(0, index);
            const afterStr = item.name.substr(index + searchValue.length);
            const title = index > -1 ? (
                <span>
                    {beforeStr}
                    <span style={{ color: '#f50' }}>{searchValue}</span>
                    {afterStr}
                </span>
            ) : <span>{item.name}</span>;

            return <TreeNode title={title} key={item.key} dataItem={item} isLeaf={item.child.length == 0}>{childs}</TreeNode>
        })
    }
    onCancel = () => {
        this.props.viewCallback({});//返回后，强制刷新
    }
    onSubmit = () => {
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading: true });

                //提交
                this.props.updateProductCource({
                    productId: this.state.dataModel.product.productId,
                    courseIds: this.state.checkedKeys.filter(a => a.indexOf('thrid:') != -1).map(a => a.split(':')[1]).join(',')
                }).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.result === false) {
                        message.error(data.message, 3);
                    }
                    else {
                        //强制刷新
                        this.props.viewCallback({});
                    }
                })
            }
        });
    }

    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode, '');
        return `商品课程${op}`;
    }

    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode, '')}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
            </FormItem>
        }
        else {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </FormItem>
        }
    }

    onSearchChange = (e) => {
        let expandedKeys = [];
        let searchValue = e.target.value;
        this.state.allTreeNodes.map((item) => {
            if (item.name.indexOf(searchValue) != -1) {
                expandedKeys.push(item.key);
            }
        })
        this.setState({
            expandedKeys,
            searchValue,
            autoExpandParent: true,
        });
    }
    onCheck = (checkedKeys, info) => {
        this.setState({ checkedKeys: checkedKeys })
    }
    onExpand = (expandedKeys) => {
        this.setState({
            expandedKeys: expandedKeys,
            autoExpandParent: false,
        });
    }
    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                let block_funTree = this.renderTree(this.state.courseTreeNodes);
                {
                    block_content = (
                        <Form layout="Vertical">
                            <Row gutter={24}>
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="商品名称"
                                    >
                                        {this.state.dataModel.product.productName}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="所属班型"
                                    >
                                        {this.state.dataModel.classTypeName}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="相关项目"
                                    >
                                        {this.state.dataModel.itemName}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="所属科目"
                                    >
                                        {this.state.dataModel.courseCategryName}
                                    </FormItem>
                                </Col>
                                <Col span={24}>
                                    <FormItem
                                        {...{
                                            labelCol: { span: 4 },
                                            wrapperCol: { span: 20 },
                                        }}
                                        style={{ paddingRight: 18 }}

                                        label="课程列表"
                                    >
                                        <div style={{ width: 400, height: 35 }}>
                                            <Search style={{ marginBottom: 8 }} placeholder="搜索课程" onChange={this.onSearchChange} />
                                        </div>
                                        {block_funTree.length > 0 && <Tree
                                            checkable
                                            autoExpandParent={this.state.autoExpandParent}
                                            checkedKeys={this.state.checkedKeys}
                                            expandedKeys={this.state.expandedKeys}
                                            onCheck={this.onCheck}
                                            onExpand={this.onExpand}
                                        >
                                            {block_funTree}
                                        </Tree>
                                        }
                                    </FormItem>
                                </Col>
                            </Row>
                        </Form >
                    )
                }
                break;
        }
        return block_content;
    }

    render() {
        let title = this.getTitle();
        let block_editModeView = this.renderEditModeOfView();
        return (
            <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                <div className="dv_split"></div>
                {block_editModeView}
                <div className="dv_split"></div>
            </ContentBox>
            // <Card title={title} extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>}>
            //     {block_editModeView}
            // </Card>

        );
    }
}

const WrappedCourseProductManage = Form.create()(CourseProductManage);

const mapStateToProps = (state) => {
    return {};
};

function mapDispatchToProps(dispatch) {
    return {
        getCourseList: bindActionCreators(getCourseList, dispatch),
        getCourseProductInfo: bindActionCreators(getCourseProductInfo, dispatch),
        updateProductCource: bindActionCreators(updateProductCource, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseProductManage);
