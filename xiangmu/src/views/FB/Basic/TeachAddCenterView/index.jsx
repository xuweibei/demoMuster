//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Modal, Radio, } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, getViewEditModeTitle, dataBind } from '@/utils';

//业务接口方法引入
import { getAreaByBranchList, getUniversityByBranchId, getCampusByUniversityId } from '@/actions/base';
import SelectUniversity from '@/components/BizSelect/SelectUniversity';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
const { TextArea } = Input;
const RadioGroup = Radio.Group;

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

class TeachAddCenterView extends React.Component {

    constructor(props) {
        super(props)
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);

        this.state = {
            dataModel: props.currentDataModel,//数据模型
            editMode: '',//Edit,Create,View,Delete
            data: [],
            dic_University: [],
            dic_Campus: [],
            totalRecord: 0,
            disable: props.currentDataModel.teachCenterType == 2,
            loading: false,

        };

    }

    componentWillMount() {

        //首次进入搜索，加载服务端字典项内容
        this.fetchUniversityList();


    }

    onSubmit = () => {
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading: true });
                setTimeout(() => {
                    this.setState({ loading: false });
                }, 3000);//合并保存数据
                this.props.viewCallback({ teachCenterId: this.state.dataModel.orgId, ...values });//合并保存数据
            }
        });
    }
    onCancel = () => {
        this.props.viewCallback();//合并保存数据
    }
    //检索高校列表数据
    fetchUniversityList = () => {
        let condition = { currentPage: 1, pageSize: 999, };
        this.props.getUniversityByBranchId(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                message.error(data.message);
            }
            else {
                this.setState({ dic_University: data.data.map((a) => { return { title: a.universityName, value: a.universityId.toString() } }) });
                if (this.state.dataModel.universityId) {
                    this.fetchCampusList(this.state.dataModel.universityId);
                }
            }
        })
    }
    //检索校区列表数据
    fetchCampusList = (universityId) => {
        let condition = { currentPage: 1, pageSize: 999, universityId: universityId };
        this.props.getCampusByUniversityId(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                message.error(data.message);
            }
            else {
                this.setState({ dic_Campus: data.data.map((a) => { return { title: a.campusName, value: a.campusId.toString() } }) });
            }
        })
    }
    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;

        switch (this.props.editMode) {
            case "AddTeachCenter":
            case "EditTeachCenter":
                block_content = (
                    <Form >
                        <Row gutter={24}>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="教学点名称"
                                >
                                    {getFieldDecorator('teachCenterName', {
                                        initialValue: this.state.dataModel.teachCenterName,
                                        rules: [{
                                            required: true, message: '请输入教学点名称!',
                                        }],
                                    })(
                                        <Input placeholder='请输入教学点名称' />
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="教学点类型"
                                >
                                    {getFieldDecorator('teachCenterType', {
                                        initialValue: this.state.dataModel.teachCenterType.toString(),
                                        rules: [{
                                            required: true, message: '请选择教学点类型!',
                                        }],
                                    })(
                                        <RadioGroup value={this.state.dataModel.teachCenterType.toString()} onChange={(e) => {
                                            e.target.value == 1 ? this.setState({ disable: false }) : this.setState({ disable: true });
                                        }}>
                                            {
                                                this.props.teach_center_type.map((item, index) => {
                                                    return <Radio value={item.value}>{item.title}</Radio>
                                                })
                                            }

                                        </RadioGroup>
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="状态"
                                >
                                    {getFieldDecorator('state', {
                                        initialValue: dataBind(this.state.dataModel.state),
                                        rules: [{
                                            required: true, message: '请选择状态!',
                                        }],
                                    })(
                                        <Select>
                                            <Option value=''>--请选择状态--</Option>
                                            {this.props.dic_Status.map((item, index) => {
                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                            })}
                                        </Select>
                                        )}
                                </FormItem>
                            </Col>
                            {!this.state.disable && <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="高校"
                                >
                                    {getFieldDecorator('universityId', {
                                        initialValue: dataBind(this.state.dataModel.universityId),
                                        rules: [{
                                            required: true, message: '请选择高校!',
                                        }],
                                    })(
                                        <SelectUniversity onChange={(value) => {
                                            this.fetchCampusList(value);
                                            this.state.dataModel.campusId = '';
                                            this.setState({ dataModel: this.state.dataModel })
                                            setTimeout(() => {
                                                {/* 重新重置才能绑定这个科目值 */ }
                                                this.props.form.resetFields(['campusId']);
                                            }, 500);
                                        }} />

                                        )}
                                </FormItem>
                            </Col>}
                            {!this.state.disable && <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="校区"
                                >
                                    {getFieldDecorator('campusId', { initialValue: dataBind(this.state.dataModel.campusId) })(
                                        <Select>
                                            <Option value=''>--请选择校区--</Option>
                                            {this.state.dic_Campus.map((item, index) => {
                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                            })}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            }
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="地址"
                                >
                                    {getFieldDecorator('address', { initialValue: this.state.dataModel.address })(
                                        <Input placeholder='请输入地址' />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="联系电话"
                                >
                                    {getFieldDecorator('mobile', { initialValue: this.state.dataModel.mobile })(
                                        <Input placeholder='请输入联系电话' />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="传真电话"
                                >
                                    {getFieldDecorator('faxPhone', { initialValue: this.state.dataModel.faxPhone })(
                                        <Input placeholder='请输入传真电话' />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="备注"
                                >
                                    {getFieldDecorator('remark', { initialValue: this.state.dataModel.remark })(
                                        <TextArea 　placeholder='请输入备注' rows={4} />
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                );
                break;

        }
        return block_content;
    }
    //表单按钮处理
    renderBtnControl() {
        return <FormItem
            className='btnControl'
            {...btnformItemLayout}
        >
            <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode == 'EditTeachCenter' ? 'Edit' : 'Create')}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
        </FormItem>
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode == 'EditTeachCenter' ? 'Edit' : 'Create');
        return `${op}教学点`;
    }
    //渲染，根据模式不同控制不同输出
    render() {
        let title = this.getTitle();
        let block_editModeView = this.renderEditModeOfView();
        return (
            <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                <div className="dv_split"></div>
                {block_editModeView}
                <div className="dv_split"></div>
            </ContentBox>
        );

    }

}

//表单组件 封装
const WrappedTeachAddCenterView = Form.create()(TeachAddCenterView);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //各业务接口
        getAreaByBranchList: bindActionCreators(getAreaByBranchList, dispatch),
        getUniversityByBranchId: bindActionCreators(getUniversityByBranchId, dispatch),
        getCampusByUniversityId: bindActionCreators(getCampusByUniversityId, dispatch),

    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedTeachAddCenterView);
