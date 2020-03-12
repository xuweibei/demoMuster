//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Layout, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, getViewEditModeTitle, dataBind } from '@/utils';


//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
class OrganizationAreaView extends React.Component {


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
            totalRecord: 0,
            loading: false,

        };

    }

    onSubmit = () => {
        if (this.props.editMode == 'AddArea') {
            //表单验证后，合并数据提交
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    this.setState({ loading: true });
                    setTimeout(() => {
                        this.setState({ loading: false });
                    }, 3000);//合并保存数据
                    this.props.viewCallback({ ...values });//合并保存数据
                }
            });
        } else {
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    this.setState({ loading: true });
                    setTimeout(() => {
                        this.setState({ loading: false });
                    }, 3000);//合并保存数据
                    this.props.viewCallback({orgId:this.state.dataModel.orgId, ...values });//合并保存数据
                }
            });
        }

    }
    onCancel = () => {
        this.props.viewCallback();//合并保存数据
    }

    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;

        switch (this.props.editMode) {
            case "AddArea":
            case "EditArea":
                block_content = (
                    <Form >
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="区域名称"
                                >
                                    {getFieldDecorator('orgName', {
                                        initialValue: this.state.dataModel.orgName,
                                        rules: [{
                                            required: true, message: '请输入区域名称!',
                                        }],
                                    })(
                                        <Input />
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="状态"
                                >
                                    {getFieldDecorator('state', { initialValue: dataBind(this.state.dataModel.state) })(
                                        <Select>
                                            {this.props.dic_Status.map((item, index) => {
                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                            })}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="负责人"
                                >
                                    {getFieldDecorator('chargeMan', {
                                        initialValue: dataBind(this.state.dataModel.chargeMan),
                                        rules: [{
                                            required: true, message: '请选择负责人!',
                                        }],
                                    })(
                                        <Input />
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="区域地址"
                                >
                                    {getFieldDecorator('address', { initialValue: this.state.dataModel.address })(
                                        <Input />
                                    )}
                                </FormItem>

                            </Col>
                            <Col span={8}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="联系电话"
                                >
                                    {getFieldDecorator('mobile', { initialValue: this.state.dataModel.mobile })(
                                        <Input />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="传真电话"
                                >
                                    {getFieldDecorator('faxPhone', { initialValue: this.state.dataModel.faxPhone })(
                                        <Input />
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
            <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode == 'EditArea' ? 'Edit' : 'Create')}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
        </FormItem>
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode == 'EditArea' ? 'Edit' : 'Create');
        return `${op}区域`;
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
const WrappedOrganizationAreaView = Form.create()(OrganizationAreaView);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedOrganizationAreaView);
